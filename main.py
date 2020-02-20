
from flask import Flask, render_template, url_for, make_response, request, jsonify, redirect

from util import json_response

import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


# @app.route("/get-cards/<int:board_id>")
# @json_response
# def get_cards_for_board(board_id: int):
#     """
#     All cards that belongs to a board
#     :param board_id: id of the parent board
#     """
#     return data_handler.get_cards_for_board(board_id)
#

@app.route("/get-statuses/<board_id>")
@json_response
def get_statuses_for_board(board_id):
    return data_handler.get_statuses_for_board(board_id)


@app.route("/get-cards/<status_id>")
@json_response
def get_cards_for_status(status_id):
    return data_handler.get_cards_for_status(status_id)



@app.route('/move', methods=['POST'])
def reorder_cards():
    req = request.get_json()
    print(req)
    card_id = int(req['id'])
    board_id = int(req['board_id'])
    status_id = int(req['status_id'])
    column_order = int(req['column_order'])

    print(card_id, board_id, status_id, column_order)
    data_handler.insert_new_ordered_cards(card_id, board_id, status_id, column_order)
    return make_response('OK', 200)


@app.route('/api/create-card', methods=['POST'])
def create_card():
    board_id = request.json['board_id']
    card_title = request.json['card_title']
    status_id = data_handler.get_first_status_id_for_board(board_id)
    data_handler.create_card(card_title, board_id, status_id)

@app.route("/api/create-board", methods=['GET','POST'])
def create_new_board():
    board_title = request.form['board-title']
    data_handler.create_new_board(board_title)
    return redirect(url_for('index'))

@app.route('/api/create-status', methods=['POST'])
def create_status():
    board_id = request.json['board_id']
    status_title = request.json['status_title']
    data_handler.add_new_status(status_title, board_id)
    return redirect("/")




def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
