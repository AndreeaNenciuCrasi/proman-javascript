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
        sql.SQL('SELECT statuses.* from statuses WHERE statuses.board_id = %s;')
            .format(
        ), [board_id]
    )

    result = cursor.fetchall()
    return result


@persistence.connection_handler
def get_cards_for_status(cursor, status_id):
    cursor.execute(
        sql.SQL('SELECT cards.* from cards WHERE cards.status_id = %s;')
            .format(
        ), [status_id]
    )

    result = cursor.fetchall()
    print(result)
    return result


# Save username and password in db
@persistence.connection_handler
def save_credentials(cursor, username, password):
    cursor.execute(
        sql.SQL("INSERT INTO {table} (username, password) VALUES(%s, %s)").format(
            table=sql.Identifier('users'),
            col1=sql.Identifier('username'),
            col2=sql.Identifier('password')
        ), [username, password]
    )


@persistence.connection_handler
def get_hash_pass(cursor, username):
    cursor.execute(
        sql.SQL('SELECT {col2} FROM {table} WHERE {col1} = %s').format(
            col1=sql.Identifier('username'),
            col2=sql.Identifier('password'),
            table=sql.Identifier('users')
        ), [username]

    )

    result = cursor.fetchall()
    return result
