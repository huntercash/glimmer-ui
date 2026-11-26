import SwiftUI

/// One row of a `Sidebar`: an icon and a title, with an optional count or switch at the trailing end.
public struct SidebarItem: Identifiable {
    public var id: String
    public var title: String
    public var systemImage: String
    /// A count shown at the end of the row. On the rail it becomes a lit dot on the icon.
    public var badge: String?
    /// The tooltip on the rail (macOS, and iPadOS with a pointer). Defaults to the title.
    public var hint: String?
    /// Makes the row a switch instead of something to select.
    public var isOn: Binding<Bool>?

    public init(_ title: String, systemImage: String, id: String? = nil, badge: String? = nil, hint: String? = nil, isOn: Binding<Bool>? = nil) {
        self.id = id ?? title
        self.title = title
        self.systemImage = systemImage
        self.badge = badge
        self.hint = hint
        self.isOn = isOn
    }

    /// The title with the letters that match `query` lit, or nil when it does not match. An empty query matches everything.
    func label(matching query: String) -> AttributedString? {
        var label = AttributedString(title)
        let query = query.trimmingCharacters(in: .whitespaces)
        guard !query.isEmpty else { return label }
        guard let hit = label.range(of: query, options: .caseInsensitive) else { return nil }
        label[hit].foregroundColor = Tokens.primary
        return label
    }
}

/// A titled list of rows in a `Sidebar`. Titles must be unique: they identify the section.
public struct SidebarSection: Identifiable {
    public var title: String
    public var items: [SidebarItem]
    public var id: String { title }

    public init(_ title: String, items: [SidebarItem]) {
        self.title = title
        self.items = items
    }
}

extension [SidebarSection] {
    func section(holding id: String) -> Int? { firstIndex { $0.items.contains { $0.id == id } } }

    /// The sections with one row moved to `section`, in front of the row `target` (at the end when nil).
    func moving(_ id: String, to section: Int, before target: String?) -> [SidebarSection] {
        guard id != target, indices.contains(section), let from = self.section(holding: id),
              let item = self[from].items.first(where: { $0.id == id }) else { return self }
        var out = self
        out[from].items.removeAll { $0.id == id }
        let at = target.flatMap { target in out[section].items.firstIndex { $0.id == target } } ?? out[section].items.endIndex
        out[section].items.insert(item, at: at)
        return out
    }

    /// The sections with one row moved a step up (-1) or down (1). Past the end of its section it lands on the near end of the next.
    func nudging(_ id: String, by way: Int) -> [SidebarSection] {
        let flat = enumerated().flatMap { index, section in section.items.map { (section: index, id: $0.id) } }
        guard let at = flat.firstIndex(where: { $0.id == id }), flat.indices.contains(at + way) else { return self }
        let other = flat[at + way]
        if other.section != flat[at].section { return moving(id, to: other.section, before: way < 0 ? nil : other.id) }
        if way < 0 { return moving(id, to: other.section, before: other.id) }
        let next = flat.indices.contains(at + 2) && flat[at + 2].section == other.section ? flat[at + 2].id : nil
        return moving(id, to: other.section, before: next)
    }
}

/// A column of menus that folds down to a rail of icons.
///
///     Sidebar(sections: $sections, selection: $page, collapsed: $folded) {
///         HStack(spacing: 12) { Avatar("G", size: 32); Text("Glimmer") }
///     } footer: {
///         HStack(spacing: 12) { Avatar("AK", size: 32); Text("Aiden Kerr") }
///     }
///
/// Click or drag the handle on its trailing edge to fold it. The search dims the rows that do not match and
/// lights the letters that do; ⌘K focuses it and Return selects the first match. Rows drag to a new place, in
/// any section, and VoiceOver has "Move up" and "Move down" actions for the same. A row that changes section
/// shows a note with Undo. The header and footer are cut off after their first 42 points on the rail, so lead with an icon.
public struct Sidebar<Header: View, Footer: View>: View {
    @Binding var sections: [SidebarSection]
    @Binding var selection: String?
    @Binding var collapsed: Bool
    var width: CGFloat
    var header: Header
    var footer: Footer

    @State private var query = ""
    @State private var note: String?
    @State private var previous: [SidebarSection] = []
    @State private var target: String?
    @State private var hovering = false
    @FocusState private var searching: Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.layoutDirection) private var direction

    private let rail: CGFloat = 58, inset: CGFloat = 8

    public init(sections: Binding<[SidebarSection]>, selection: Binding<String?>, collapsed: Binding<Bool>, width: CGFloat = 272,
                @ViewBuilder header: () -> Header = { EmptyView() }, @ViewBuilder footer: () -> Footer = { EmptyView() }) {
        _sections = sections
        _selection = selection
        _collapsed = collapsed
        self.width = width
        self.header = header()
        self.footer = footer()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            header.padding(5)
            search
            ForEach(Array(sections.enumerated()), id: \.element.id) { index, section in
                title(section, at: index)
                ForEach(section.items) { row($0, in: index) }
            }
            Spacer(minLength: inset)
            if let note { undo(note) }
            footer.padding(5)
        }
        .padding(inset)
        // Laid out at full width, then cut down to the rail: the rail is the same rows, clipped after the icon.
        .frame(width: width, alignment: .leading)
        .frame(width: collapsed ? rail : width, alignment: .leading)
        .clipped()
        .glass()
        .overlay(alignment: .trailing) { handle }
        .background {
            Button("Search") { searching = true }.keyboardShortcut("k", modifiers: .command).opacity(0).accessibilityHidden(true)
        }
        .onChange(of: searching) { _, focused in
            if focused { collapsed = false } // the search icon on the rail opens the sidebar to type in
        }
        .task(id: note) {
            guard note != nil, (try? await Task.sleep(for: .seconds(4))) != nil else { return }
            note = nil
        }
        .animation(reduceMotion ? nil : .easeOut(duration: Tokens.durationBase), value: collapsed)
        .animation(reduceMotion ? nil : .easeOut(duration: Tokens.durationFast), value: query)
    }

    private var search: some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusMd, style: .continuous)
        return HStack(spacing: 12) {
            Image(systemName: "magnifyingglass").frame(width: 18)
            TextField("Search", text: $query)
                .textFieldStyle(.plain)
                .focused($searching)
                .opacity(collapsed ? 0 : 1)
                .onSubmit {
                    guard !query.isEmpty, let first = sections.flatMap(\.items).first(where: { $0.isOn == nil && $0.label(matching: query) != nil }) else { return }
                    selection = first.id
                }
            Text("⌘K").font(.glimmerMono(.caption2))
        }
        .foregroundStyle(Tokens.muted)
        .padding(.horizontal, 12)
        .frame(height: 36)
        .background(.white.opacity(0.05), in: shape)
        .overlay(shape.strokeBorder(searching ? Tokens.primary.opacity(0.7) : Tokens.border, lineWidth: 1))
        .contentShape(Rectangle())
        .onTapGesture { searching = true }
        .padding(.vertical, 4)
    }

    /// The heading above a section. On the rail it becomes a hairline. Dropping a row on it puts the row first in the section.
    private func title(_ section: SidebarSection, at index: Int) -> some View {
        Group {
            if collapsed {
                Rectangle().fill(Tokens.border).frame(width: rail - inset * 2 - 24, height: 1).padding(.horizontal, 12).padding(.vertical, 8)
            } else {
                Text(section.title).metaStyle().padding(.horizontal, 12).padding(.top, 8).padding(.bottom, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
        .dropDestination(for: String.self) { ids, _ in drop(ids, in: index, before: section.items.first?.id) }
    }

    private func row(_ item: SidebarItem, in section: Int) -> some View {
        let label = item.label(matching: query), selected = selection == item.id
        let content = HStack(spacing: 12) {
            Image(systemName: item.systemImage)
                .frame(width: 18)
                .overlay(alignment: .topTrailing) {
                    if item.badge != nil { StatusDot(Tokens.primary).scaleEffect(0.75).offset(x: 4, y: -4) }
                }
            Text(label ?? AttributedString(item.title)).lineLimit(1).opacity(collapsed ? 0 : 1) // its first letters would show on the rail
            Spacer(minLength: 8)
            if let badge = item.badge { Badge(badge, color: Tokens.primary) }
            if let isOn = item.isOn { Toggle(item.title, isOn: isOn).labelsHidden().toggleStyle(.switch) }
        }
        .font(.glimmer(.subheadline))
        .padding(.horizontal, 12)
        .frame(height: 36)
        .background(.white.opacity(selected ? 0.08 : 0), in: RoundedRectangle(cornerRadius: Tokens.radiusSm, style: .continuous))
        .contentShape(Rectangle())

        return Group {
            if item.isOn == nil {
                Button { selection = item.id } label: { content }.buttonStyle(.plain)
            } else {
                content
            }
        }
        // the lit dot beside the current row, and a line where a dragged row will land
        .overlay(alignment: .leading) {
            if selected { Circle().fill(Tokens.primary).frame(width: 6, height: 6).shadow(color: Tokens.primary, radius: 4).offset(x: -7) }
        }
        .overlay(alignment: .top) {
            if target == item.id { Rectangle().fill(Tokens.primary).frame(height: 2).offset(y: -3) }
        }
        .opacity(label == nil ? 0.35 : 1)
        .help(item.hint ?? item.title)
        .draggable(item.id)
        .dropDestination(for: String.self) { ids, _ in
            drop(ids, in: section, before: item.id)
        } isTargeted: { over in
            if over { target = item.id } else if target == item.id { target = nil }
        }
        .accessibilityAddTraits(selected ? .isSelected : [])
        .accessibilityAction(named: "Move up") { apply(sections.nudging(item.id, by: -1), moved: item.id) }
        .accessibilityAction(named: "Move down") { apply(sections.nudging(item.id, by: 1), moved: item.id) }
    }

    private func drop(_ ids: [String], in section: Int, before target: String?) -> Bool {
        guard let id = ids.first, sections.section(holding: id) != nil else { return false } // not one of this sidebar's rows
        apply(sections.moving(id, to: section, before: target), moved: id)
        return true
    }

    /// Commits a move. A row that changed section gets a note with Undo.
    private func apply(_ moved: [SidebarSection], moved id: String) {
        guard let from = sections.section(holding: id), let to = moved.section(holding: id) else { return }
        previous = sections
        sections = moved
        guard from != to, let item = moved[to].items.first(where: { $0.id == id }) else { return }
        note = "\(item.title) moved to \(moved[to].title)"
    }

    private func undo(_ note: String) -> some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusMd, style: .continuous)
        return HStack(spacing: 12) {
            Text(note).lineLimit(1)
            Spacer(minLength: 8)
            Button("Undo") {
                sections = previous
                self.note = nil
            }
            .buttonStyle(.plain)
            .foregroundStyle(Tokens.primary)
        }
        .font(.glimmer(.footnote))
        .padding(.horizontal, 12)
        .frame(height: 36)
        .background(.white.opacity(0.06), in: shape)
        .overlay(shape.strokeBorder(Tokens.border, lineWidth: 1))
    }

    /// The strip along the trailing edge: click it to fold or unfold, or drag it.
    private var handle: some View {
        Button { collapsed.toggle() } label: {
            Capsule()
                .fill(Tokens.content.opacity(hovering ? 0.8 : 0.2))
                .frame(width: 4, height: 32)
                .frame(width: 16)
                .frame(maxHeight: .infinity)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .offset(x: 8)
        .onHover { hovering = $0 }
        .simultaneousGesture(DragGesture(minimumDistance: 16).onChanged { drag in
            collapsed = (drag.translation.width < 0) == (direction == .leftToRight) // towards the sidebar folds it
        })
        .accessibilityLabel(collapsed ? "Expand sidebar" : "Collapse sidebar")
    }
}
