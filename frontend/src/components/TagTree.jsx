import { useState } from "react";

export default function TagTree({ tagsFlat, tagTree, selectedTagIds, setSelectedTagIds }) {
  const [expanded, setExpanded] = useState({});

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function TagNode({ node, level = 0 }) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];
    const isSelected = selectedTagIds.includes(node.id);

    return (
      <div className="tag-node" style={{ marginLeft: level * 12 }}>
        <div className={`tag-row ${isSelected ? "tag-row-selected" : ""}`}>
          {hasChildren ? (
            <button
              className="tag-toggle"
              onClick={() => toggleExpand(node.id)}
              aria-label="toggle"
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          ) : (
            <span className="tag-toggle-placeholder" />
          )}
          <button
            className={`tag-name ${isSelected ? "text-blue-600 font-semibold" : ""}`}
            onClick={() => {
              setSelectedTagIds((prev) =>
                isSelected ? prev.filter((id) => id !== node.id) : [...prev, node.id]
              );
            }}
            title={`Filtrer par ${node.name}`}
          >
            {node.name}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="tag-children">
            {node.children.map((child) => (
              <TagNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tag-tree">
      {tagTree.length === 0 && <div className="muted">Aucun tag</div>}
      {tagTree.map((node) => (
        <TagNode key={node.id} node={node} />
      ))}
    </div>
  );
}
