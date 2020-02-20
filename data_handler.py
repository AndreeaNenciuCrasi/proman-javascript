import persistence
from psycopg2 import sql


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


@persistence.connection_handler
def get_boards(cursor):
    """
    Gather all boards
    :return:
    """
    # return persistence.get_boards(force=True)
    cursor.execute(
        sql.SQL('SELECT * FROM {boards};')
            .format(
            boards=sql.Identifier('boards')
        )
    )

    result = cursor.fetchall()
    return result


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards


@persistence.connection_handler
def get_statuses_for_board(cursor, board_id):
    cursor.execute(
        sql.SQL('SELECT statuses.* from statuses WHERE statuses.board_id = (%s);')
            .format(
        ), [board_id]
    )

    result = cursor.fetchall()
    return result


@persistence.connection_handler
def get_cards_for_status(cursor, status_id):
    cursor.execute(
        sql.SQL('SELECT cards.* from cards WHERE cards.status_id = (%s) ORDER BY cards.column_order;')
            .format(
        ), [status_id]
    )

    result = cursor.fetchall()
    return result


@persistence.connection_handler
def insert_new_ordered_cards(cursor, card_id, board_id, status_id, column_order):
    cursor.execute(
        sql.SQL('UPDATE {cards} SET {board_id} = (%s), {status_id} = (%s), {column_order} = (%s) WHERE {id} = (%s);')
            .format(
            cards=sql.Identifier('cards'),
            board_id=sql.Identifier('board_id'),
            status_id=sql.Identifier('status_id'),
            column_order=sql.Identifier('column_order'),
            id=sql.Identifier('id')
        ), [board_id, status_id, column_order, card_id]
    )


@persistence.connection_handler
def get_first_status_id_for_board(cursor, board_id):
    cursor.execute(f"""
        SELECT id FROM statuses WHERE board_id = {board_id}
        ORDER BY id ASC;
""")
    result = cursor.fetchone()
    return result['id']


@persistence.connection_handler
def create_card(cursor, card_title, board_id, status_id):
    cursor.execute(f"""
        INSERT INTO cards (title, board_id, status_id)
        VALUES ('{card_title}', {board_id}, {status_id});
""")

@persistence.connection_handler
def create_new_board(cursor, board_title, owner_public='public'):
    cursor.execute(f'''
        INSERT INTO boards (title, owner)
        VALUES ('{board_title}','{owner_public}');
''')


@persistence.connection_handler
def add_new_status(cursor, status_title, border_id):
    query = "INSERT INTO statuses (title, board_id) VALUES (%s, %s);"
    cursor.execute(query, (status_title, int(border_id)))



