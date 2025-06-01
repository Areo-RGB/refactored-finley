#!/usr/bin/env python3
"""
Script to add rank numbers to all tables in the HTML file.
This script will update all table headers and add rank numbers to each result card.
"""

import re
import sys

def update_table_headers(content):
    """Update all table headers to include RANK column"""

    # Pattern to find headers that don't have RANK yet
    header_pattern = r'(<div class="sprint-card sprint-card-header mb-2">\s*<div class="d-flex justify-content-between align-items-center">\s*)<span class="sprint-card-label">Name</span>\s*<span class="sprint-card-label">Result \([^)]+\)</span>'

    def replace_header(match):
        prefix = match.group(1)
        return f'''{prefix}<span class="sprint-card-label">RANK</span>
                                    <span class="sprint-card-label">NAME</span>
                                    <span class="sprint-card-label">RESULT</span>'''

    content = re.sub(header_pattern, replace_header, content, flags=re.MULTILINE | re.DOTALL)

    # Also handle the specific case with "Result (count)" for Balljonglieren
    header_pattern_count = r'(<div class="sprint-card sprint-card-header mb-2">\s*<div class="d-flex justify-content-between align-items-center">\s*)<span class="sprint-card-label">Name</span>\s*<span class="sprint-card-label">Result \(count\)</span>'

    def replace_header_count(match):
        prefix = match.group(1)
        return f'''{prefix}<span class="sprint-card-label">RANK</span>
                                    <span class="sprint-card-label">NAME</span>
                                    <span class="sprint-card-label">RESULT (COUNT)</span>'''

    content = re.sub(header_pattern_count, replace_header_count, content, flags=re.MULTILINE | re.DOTALL)

    return content

def add_ranks_to_table_section(content, start_marker, end_marker):
    """Add rank numbers to a specific table section"""

    # Find the table section
    start_pos = content.find(start_marker)
    if start_pos == -1:
        print(f"Warning: Could not find start marker: {start_marker}")
        return content

    end_pos = content.find(end_marker, start_pos)
    if end_pos == -1:
        print(f"Warning: Could not find end marker: {end_marker}")
        return content

    table_section = content[start_pos:end_pos]

    # Find all result cards in order and add ranks
    card_pattern = r'<div class="sprint-card (?:benchmark-card|player-card(?:-secondary)?)(?: bg-highlight)? mb-2">\s*<div class="d-flex justify-content-between align-items-center">\s*(?!<span class="sprint-card-rank">)(<span class="sprint-card-name"[^>]*>[^<]+</span>\s*<span class="sprint-card-result"[^>]*>[^<]+</span>)\s*</div>\s*</div>'

    rank_counter = 1

    def add_rank(match):
        nonlocal rank_counter
        name_and_result = match.group(1)
        full_match = match.group(0)

        # Determine if this is a player card to match styling
        if 'player-card' in full_match and 'color-white font-weight-bold' in name_and_result:
            rank_span = f'<span class="sprint-card-rank color-white font-weight-bold">{rank_counter}.</span>'
        else:
            rank_span = f'<span class="sprint-card-rank">{rank_counter}.</span>'

        # Reconstruct the card with rank
        card_class_match = re.search(r'<div class="sprint-card ([^"]+)"', full_match)
        card_classes = card_class_match.group(1) if card_class_match else ""

        result = f'''<div class="sprint-card {card_classes}">
                                <div class="d-flex justify-content-between align-items-center">
                                    {rank_span}
                                    {name_and_result}
                                </div>
                            </div>'''

        rank_counter += 1
        return result

    updated_section = re.sub(card_pattern, add_rank, table_section, flags=re.MULTILINE | re.DOTALL)

    return content[:start_pos] + updated_section + content[end_pos:]

def main():
    """Main function to process the HTML file"""

    input_file = 'index.html'

    try:
        # Read the HTML file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()

        print("Updating table headers...")
        content = update_table_headers(content)

        # Define table sections to update (excluding 10m Sprint which is already done)
        tables_to_update = [
            {
                'name': '20m Sprint',
                'start': '<h5 class="mb-3 text-center">20m Sprint Results</h5>',
                'end': '<h5 class="mb-3 text-center">Gewandtheit Results</h5>'
            },
            {
                'name': 'Gewandtheit',
                'start': '<h5 class="mb-3 text-center">Gewandtheit Results</h5>',
                'end': '<h5 class="mb-3 text-center">Ballkontrolle Results</h5>'
            },
            {
                'name': 'Ballkontrolle',
                'start': '<h5 class="mb-3 text-center">Ballkontrolle Results</h5>',
                'end': '<h5 class="mb-3 text-center">Balljonglieren Results</h5>'
            },
            {
                'name': 'Balljonglieren',
                'start': '<h5 class="mb-3 text-center">Balljonglieren Results</h5>',
                'end': '<h5 class="mb-3 text-center">Dribbling Results</h5>'
            },
            {
                'name': 'Dribbling',
                'start': '<h5 class="mb-3 text-center">Dribbling Results</h5>',
                'end': '</div>\n                    </div>\n                </div>\n            </div>'
            }
        ]

        # Update each table
        for table in tables_to_update:
            print(f"Adding ranks to {table['name']} table...")
            content = add_ranks_to_table_section(content, table['start'], table['end'])

        # Write the updated content back to the file
        with open(input_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ Successfully added rank numbers to all tables!")
        print("📊 Updated tables:")
        for table in tables_to_update:
            print(f"   - {table['name']}")

    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
