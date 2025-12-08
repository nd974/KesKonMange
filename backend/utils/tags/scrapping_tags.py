import json

with open("tags.json", "r", encoding="utf-8") as f:
    data = json.load(f)

insert_statements = []
current_id = 1  # compteur pour l'id auto-généré

def sql_escape(s):
    # Échappe les apostrophes pour SQL
    return s.replace("'", "''")

def process(node, parent_id=None):
    global current_id
    if isinstance(node, dict):
        for k, v in node.items():
            this_id = current_id
            name = sql_escape(k)
            insert_statements.append(
                f"""INSERT INTO "Tag" (id, name, parent_id) VALUES ({this_id}, '{name}', {parent_id if parent_id else 'NULL'});"""
            )
            current_id += 1
            process(v, this_id)
    elif isinstance(node, list):
        for item in node:
            this_id = current_id
            name = sql_escape(item)
            insert_statements.append(
                f"""INSERT INTO "Tag" (id, name, parent_id) VALUES ({this_id}, '{name}', {parent_id});"""
            )
            current_id += 1

process(data)

# Afficher les INSERTs
for stmt in insert_statements:
    print(stmt)
