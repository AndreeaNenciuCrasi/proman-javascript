// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";


let statusesDraggable = [];
export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);

        });

        // const boardExpandButton = document.getElementById('')\


    },

    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        let boardList = '';
        for (let board of boards) {
            boardList += `
               <div>
                    <p>
                        <div class="navbar navbar-light bg-light rounded">
                            <div class="d-flex flex-row">
                              <a class="btn btn-light" data-toggle="collapse" href="#collapseExample${board.id}"  role="button" aria-expanded="false" aria-controls="collapseExample">
                                ${board.title}
                              </a>
                              <button type="button" class="btn btn-light rounded border-secondary" id="buttonNewCardForBoard${board.id}">+ New Card</button>

                            </div>
                            
                            <button id ="board_${board.id}" class="btn btn-light rounded border-secondary" type="button" data-toggle="collapse" data-target="#collapseExample${board.id}" aria-expanded="false" aria-controls="collapseExample">
                                v
                            </button>
                        </div>
                    </p>
                    <div class="collapse" id="collapseExample${board.id}">

                    <button id="buttonNewStatusForBoard${board.id}" class="btn btn-light rounded border-secondary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                    + New Column
                    </button>
                      <div class="collapse inputClass" id="collapseExample">
                        <input type="text" class="inputId" placeholder="Add new Status">
                    </div>
                    <div class="container">

                      <div class="card card-body container " >
                      <div class="container-fluid">
                      <div class="row" id="${board.id}">
                      
                        
                        </div>
                      </div>
                     </div>
                     
                </div>
            
`;

        }

        const outerHtml = `

            <ul  class="board-container">
                ${boardList}
            </ul>
          
        `;

        let boardsContainer = document.querySelector('#boards');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);

        const boardExpandButton = document.getElementsByTagName('button');

        console.log('all buttons: ', boardExpandButton);
        // console.log(boardExpandButton);



        console.clear();
        for (let button of boardExpandButton) {
            if (button.id.slice(0, 21) === 'buttonNewCardForBoard') {
                button.addEventListener('click', handleNewCardClick);
            }
            else {
            button.addEventListener('click', async function (event) {
                let idForBoard = button.id.slice(6);
                let response = await fetch(`${window.origin}/get-statuses/${idForBoard}`);
                response = await response.json();
                //console.log(response);
                let boardBody = document.getElementById(`${idForBoard}`);
                boardBody.innerHTML = '';

                for (let element of response) {
                    createAppend(element);
                    let columnResponse = await fetch(`${window.origin}/get-cards/${element.id}`);
                    columnResponse = await columnResponse.json();
                    let columnBody = document.getElementById(`column_tr_${element.id}`);
                    columnBody.innerHTML = '';
                    columnBody.innerText = element.title;
                    for (let card of columnResponse) {
                        // console.log(card);
                        createAppendCard(card);
                    }
                  
//             if (button.id.includes('buttonNewStatusForBoard')) {
//                 // console.log('entered if ');
//                 button.addEventListener('click', handleNewColumnclick);

//             } else {
//                 button.addEventListener('click', async function (event) {
//                     let idForBoard = button.id.slice(6);
//                     let response = await fetch(`${window.origin}/get-statuses/${idForBoard}`);
//                     response = await response.json();
//                     console.log(response);
//                     let boardBody = document.getElementById(`${idForBoard}`);
//                     boardBody.innerHTML = '';
//                     for (let element of response) {
//                         createAppend(element);
//                         // console.log('Enter fetch');
//                         let columnResponse = await fetch(`${window.origin}/get-cards/${element.id}`);
//                         // console.log('Before JSON');
//                         columnResponse = await columnResponse.json();
//                         // console.log('After fetch');
//                         let columnBody = document.getElementById(`column_tr_${element.id}`);
//                         columnBody.innerHTML = '';
//                         columnBody.innerText = element.title;
//                         for (let card of columnResponse) {
//                             createAppendCard(card);
//                         }


                    }


                    insertObjectInArray(columnBody, statusesDraggable);

                }
                console.log(statusesDraggable);
                let drake = dragula(statusesDraggable).on('drop', function (el, target, source, sibling) {
                    el.dataset.card = target.id;
                    el.dataset.board = target.dataset.board;
                    let i = 0;
                    if (source.length > 0) {
                        for (let child of source.children) {

                            child.dataset.order = i;
                            i += 1;
                            console.log(child, 'from source');
                            let dataToSend = {
                                status_id: child.dataset.card.slice(10),
                                board_id: child.dataset.board,
                                column_order: child.dataset.order,
                                id: child.id.slice(5)
                            };
                            fetch(`${window.origin}/move`, {
                                method: 'POST',
                                credentials: "include",
                                cache: "no-cache",
                                headers: new Headers({
                                    'content-type': 'application/json'
                                }),
                                body: JSON.stringify(dataToSend)
                            });
                        }
                    }
                    i = 0;
                    for (let child of target.children) {
                        child.dataset.order = i;
                        i += 1;
                        console.log(child, 'from target');
                        let dataToSend = {
                            status_id: child.dataset.card.slice(10),
                            board_id: child.dataset.board,
                            column_order: child.dataset.order,
                            id: child.id.slice(5)
                        };
                        fetch(`${window.origin}/move`, {
                            method: 'POST',
                            credentials: "include",
                            cache: "no-cache",
                            headers: new Headers({
                                'content-type': 'application/json'
                            }),
                            body: JSON.stringify(dataToSend)
                        });
                    }


                });
                console.log(`Board event ${this.id} expanded`);
            });
            }
        }
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features

};

function createAppend(element) {

    let boardBody = document.getElementById(`${element.board_id}`)
    let column = document.createElement('div');
    column.setAttribute('class', 'col-md text-center');
    // let column_tr = document.createElement('p');

//     let boardBody = document.getElementById(`${element.board_id}`);
//     let column = document.createElement('th');
//     let column_tr = document.createElement('tr');

    // column.setAttribute('class', 'col-sm');
    column.setAttribute('style', 'margin:10px; border: 2px solid black; display: table');
    // column.setAttribute('style', 'display: block;')
    column.setAttribute('id', `column_${element.id}`);
    column.setAttribute('id', `column_tr_${element.id}`);
    column.setAttribute('data-board', element.board_id);
    column.innerText = `test ${element.title}`;
    boardBody.appendChild(column);
    // boardBody.appendChild(column_tr);

}

function createAppendCard(element) {

    let columnBody = document.getElementById(`column_tr_${element.status_id}`);
    let cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'col-md');
    cardBody.setAttribute('style', ' border: 2px solid black; margin: 6px;');
    cardBody.setAttribute('id', `card_${element.id}`);
    cardBody.setAttribute('data-card', `${columnBody.id}`);
    cardBody.setAttribute('data-board', columnBody.dataset.board);
    cardBody.setAttribute('data-order', element['column_order']);
    cardBody.innerText += `${element.title}`;
    columnBody.appendChild(cardBody);

}

const insertObjectInArray = (elem, arr) => {

    // console.log('element compared',elem);
    // console.log('arr elems', arr[0]);
    let search = 0;
    let pos;
    if (arr.length === 0) {
        arr.push(elem);
    }
    for (let el of arr) {

        if (elem.id != el.id) {
            search += 1;
        } else {
            pos = arr.indexOf(el)
        }
    }
    if (search === arr.length) {
        arr.push(elem);
    } else {
        arr.splice(pos, 1);
        arr.push(elem);
    }

}

//     let columnBody = document.getElementById(`column_tr_${element.id}`);
// if (columnBody) {
//         let card = document.createElement('td');
//         card.setAttribute('class', 'col-md-2');
//         card.setAttribute('style', ' margin: 30px; border: 2px solid black');
//         card.setAttribute('id', `card_${element.id}`);
//         card.innerText += `${element.title}`;
//         columnBody.appendChild(card);
//     }
}

function handleNewCardClick(event) {
    let board_id = event.target.id.slice(21);
    let card_title = 'New Card';
    let data = { board_id, card_title};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('http://localhost:5000/api/create-card', options);
}


function handleNewColumnclick(event) {
    console.clear()
    let board_id = event.target.id.slice(-1);
    let inputsColumnName = document.querySelectorAll("input");
    // let status_title;

    // console.log(input);
    for (let input of inputsColumnName){
        input.addEventListener('change', function (event) {
        console.log(event.target.value);
        let status_title = event.target.value;
        let data = {board_id, status_title};
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        fetch('http://127.0.0.1:5000/api/create-status', options).then(() => location.reload());
    });
    }








