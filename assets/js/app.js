const todoForm = document.getElementById("todoForm");
const spinner = document.getElementById("spinner");
const updateTodoBtn = document.getElementById("updateTodoBtn");

const baseTodoUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const todoUrl = `${baseTodoUrl}/todo.json`;


function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000
    })
}

const localState = {
    todoArray: [],
    editId: null
}

function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}


//raad 

function fetchTodos() {
    handleSpinner(true);
    fetch(todoUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "security": "JWT from local storage"
        },
        body: null
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error while fetching data!!!`);
            }
            return res.json();
        })
        .then(data => {
            for (let key in data) {
                data[key].id = key;
                localState.todoArray.unshift(data[key]);
            }
            createTodos(localState.todoArray);
        })
        .catch(err => {
            snackBar(`Error while fetching data`, "error");
        })
        .finally(() => {
            handleSpinner();
        })
}

fetchTodos();

function createTodos(arr) {
    const todoContainer = document.getElementById("todoContainer");
    let res = "";
    arr.forEach(todo => {
        res += `
            <li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                <strong>${todo.todoItem}</strong>
                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
            </li>
        `
    });
    todoContainer.innerHTML = res;
}

function onTodoAdd(event) {
    const todoInputControl = document.getElementById("todoInput");

    event.preventDefault();
    const newTodo = {
        todoItem: todoInputControl.value
    }
    handleSpinner(true);
    fetch(todoUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "secutity": "JWT token"
        },
        body: JSON.stringify(newTodo)
    })
        .then(res => res.json())
        .then(data => {
            todoForm.reset();
            newTodo.id = data.name;
            localState.todoArray.unshift(newTodo);
            let newLi = document.createElement("li");
            newLi.id = data.name;
            newLi.className = "list-group-item d-flex justify-content-between";
            newLi.innerHTML = `
                <strong>${newTodo.todoItem}</strong>
                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
        `;
            todoContainer.prepend(newLi);
            snackBar(`New todo with id : ${newTodo.id} is added successfully...`, "success");
        })
        .catch(err => {
            snackBar(err, "error");
        })
        .finally(() => {
            handleSpinner(false);
        })
}

function onEdit(ele){
    const todoInputControl = document.getElementById("todoInput");
    const todoAddBtn = document.getElementById("addTodoBtn");
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArray.find(t => t.id === editId);
    todoInputControl.value = editObj.todoItem;
    todoAddBtn.classList.add("d-none");
    updateTodoBtn.classList.remove("d-none");
}


function onTodoUpdate(){
    const todoAddBtn = document.getElementById("addTodoBtn");
    const todoInputControl = document.getElementById("todoInput");
    const updateId = localState.editId;
    localState.editId = null;
    const udpateUrl = `${baseTodoUrl}/todo/${updateId}.json`;
    const updatedObj = {
        todoItem : todoInputControl.value,
        id : updateId
    }
    handleSpinner(true);
    fetch(udpateUrl, {
        method : "PATCH",
        body : JSON.stringify(updatedObj),
        headers : {
            "Content-Type" : "applicatin/josn",
            "security" : "JWT token"
        }
    })
    .then( res => {
        if(!res.ok){
            throw new Error("Error while making patch request");
        }
        return res.json();
    })
    .then(data => { 
        todoForm.reset();
        const updateIndex = localState.todoArray.findIndex(t => t.id === updateId);
        localState.todoArray[updateIndex] = updatedObj;
        let updateLi = document.getElementById(updateId);
        updateLi.querySelector("strong").innerText = updatedObj.todoItem;
        snackBar(`Todo with id: ${updateId} is updated successfully...`, "success");
        todoAddBtn.classList.remove("d-none");
        updateTodoBtn.classList.add("d-none");
    })
    .catch( err => {
        snackBar(err, "error");
    })
    .finally( () => {
        handleSpinner();    
    })
}

function onDelete(ele) {
    const deleteId = ele.closest("li").id;
    const deleteUrl = `${baseTodoUrl}/todo/${deleteId}.json`;
    Swal.fire({
        title: "Are you sure?",
        text: "You want to delete todo with id : " + deleteId ,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(1);
            fetch(deleteUrl, {
                method: "DELETE",
                body: null,
                headers: {
                    "Content-Type": "applicatin/json",
                    "security": "JWT TOKEN"
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Error while making delte request!!!");
                    }
                    return res.json();
                })
                .then((data) => {
                    const deleteIndex = localState.todoArray.findIndex(t => t.id === deleteId);
                    localState.todoArray.splice(deleteIndex, 1);
                    ele.closest("li").remove();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your todo has been deleted.",
                        icon: "success",
                        timer: 3000
                    });
                })
                .catch(err => {
                    snackBar(`Error while deleting todo : ${err}`, "error");
                })
                .finally(() => {
                    handleSpinner();
                })
        }
    });
}


todoForm.addEventListener("submit", onTodoAdd);
updateTodoBtn.addEventListener("click", onTodoUpdate)