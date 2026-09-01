#!/usr/bin/env python3
"""Generate menu-data.ts from Amavery API for Trattoria da Piero menu 21."""

import html
import json
import re
import urllib.request

CATEGORIES = [
    (0, 'Antipasti'),
    (1, 'Primi'),
    (2, 'Risotti'),
    (3, 'Secondi'),
    (4, 'Insalate'),
    (5, 'Dolci'),
    (6, 'Bevande e Vini'),
    (7, 'Cocktail'),
]

SALAD_NAMES = {
    'Insalata Pomodoro siciliano',
    'Insalata mista',
    'Caprese',
    'Insalata Tonno',
}

COCKTAIL_NAMES = {
    'Cedrata Spritz',
    'Mandarino Spritz',
    'Negroni',
    'Hugo',
    'Gin Tonic',
    'Lemon Spritz',
    'Limoncello Spritz',
    'Spritz Siciliano',
    'Orange Spritz',
    'Campari Spritz',
    'Amaro della casa',
}

SECTION_HEADERS = {
    'I nonni',
    'Bevande e Vini',
    'Bevande Siciliane',
    'Aranciata rossa',
    'I nostri Vini',
}


def fetch_all_items():
    req = urllib.request.Request(
        'https://amavery.com/app/menu.zsp?ajaxCommand=allItems&ajaxParam1=21&ajaxParam2=1&ajaxParam3=0',
        method='POST',
        headers={'User-Agent': 'Mozilla/5.0 (iPhone)', 'Zed-Ajax': 'https://amavery.com'},
    )
    return json.loads(urllib.request.urlopen(req).read())


def clean_text(value: str) -> str:
    text = html.unescape(value or '')
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def map_page_to_category(page_id: int, page_header: str) -> int | None:
    mapping = {
        365: 0,  # Antipasti
        367: 1,  # Primi
        368: 2,  # Risotti
        369: 3,  # Secondi (salads remapped later)
        366: 5,  # Dolci
        3250: 6,  # Bevande (cocktails remapped later)
    }
    return mapping.get(page_id)


def escape_ts(value: str) -> str:
    return value.replace('\\', '\\\\').replace("'", "\\'")


def main():
    data = fetch_all_items()
    items = []
    item_id = 1

    for page_id_str, page_items in data.items():
        page_id = int(page_id_str)
        if page_id in (364, 2381):
            continue

        page_header = ''
        for entry in page_items:
            if entry.get('type') == 'H':
                page_header = clean_text(entry.get('origName') or entry.get('voice') or '')
                break

        category_id = map_page_to_category(page_id, page_header)
        if category_id is None:
            continue

        for entry in page_items:
            if entry.get('type') != 'V':
                continue

            name = clean_text(entry.get('origName') or entry.get('voice') or '')
            if not name or name in SECTION_HEADERS:
                continue

            price = float(entry.get('price') or 0)
            description = clean_text(entry.get('subDesc') or entry.get('text') or '')

            final_category = category_id
            if name in SALAD_NAMES:
                final_category = 4
            elif name in COCKTAIL_NAMES:
                final_category = 7
            elif page_id == 3250 and final_category == 6 and name in COCKTAIL_NAMES:
                final_category = 7

            items.append(
                {
                    'id': item_id,
                    'name': name,
                    'description': description,
                    'price': price,
                    'categoryId': final_category,
                    'ingredients': [],
                    'allergens': [],
                    'isVegan': False,
                    'isGlutenFree': False,
                    'isBestSeller': 'consigliat' in name.lower() or 'specialità' in name.lower(),
                }
            )
            item_id += 1

    lines = [
        'export interface MenuItem {',
        '  id: number',
        '  name: string',
        '  description: string',
        '  price: number',
        '  categoryId: number',
        '  ingredients: string[]',
        '  allergens: string[]',
        '  isVegan: boolean',
        '  isGlutenFree: boolean',
        '  isBestSeller: boolean',
        '}',
        '',
        'export interface Category {',
        '  id: number',
        '  name: string',
        '  order: number',
        '}',
        '',
        'export const categories: Category[] = [',
    ]

    for cid, name in CATEGORIES:
        lines.append(f"  {{ id: {cid}, name: '{name}', order: {cid} }},")

    lines.append(']')
    lines.append('')
    items.sort(key=lambda i: (i['categoryId'], i['id']))

    # Re-number ids after sorting
    for index, item in enumerate(items, start=1):
        item['id'] = index

    lines.append('export const menuItems: MenuItem[] = [')

    current_category = None
    for item in items:
        if item['categoryId'] != current_category:
            current_category = item['categoryId']
            cat_name = next(name for cid, name in CATEGORIES if cid == current_category)
            lines.append(f'  // {cat_name} ({current_category})')

        desc = escape_ts(item['description'])
        name = escape_ts(item['name'])
        lines.append('  {')
        lines.append(f"    id: {item['id']},")
        lines.append(f"    name: '{name}',")
        lines.append(f"    description: '{desc}',")
        lines.append(f"    price: {item['price']},")
        lines.append(f"    categoryId: {item['categoryId']},")
        lines.append('    ingredients: [],')
        lines.append('    allergens: [],')
        lines.append(f"    isVegan: {str(item['isVegan']).lower()},")
        lines.append(f"    isGlutenFree: {str(item['isGlutenFree']).lower()},")
        lines.append(f"    isBestSeller: {str(item['isBestSeller']).lower()},")
        lines.append('  },')

    lines.append(']')
    lines.append('')

    output = '\n'.join(lines)
    with open('/workspace/data/menu-data.ts', 'w', encoding='utf-8') as f:
        f.write(output)

    print(f'Generated {len(items)} menu items')
    for cid, name in CATEGORIES:
        count = sum(1 for i in items if i['categoryId'] == cid)
        print(f'  {name}: {count}')


if __name__ == '__main__':
    main()
