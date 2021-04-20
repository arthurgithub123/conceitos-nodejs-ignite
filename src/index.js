const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  
  if(!user) {
    return response.status(404).json({ error: 'User does not exist' });
  }
  
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name } = request.body;
  const { username } = request.body;
  
  const user = users.find(user => user.username === username);

  if(user) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const todoToUpdateIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(todoToUpdateIndex === -1) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  user.todos[todoToUpdateIndex].title = title;
  user.todos[todoToUpdateIndex].deadline = new Date(deadline);
  
  return response.send(user.todos[todoToUpdateIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToUpdateIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoToUpdateIndex === -1) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  user.todos[todoToUpdateIndex].done = true;

  return response.send(user.todos[todoToUpdateIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todoToDeleteIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoToDeleteIndex === -1) {
    return response.status(404).json({ error: 'Todo does not exist' });
  }

  user.todos.splice(todoToDeleteIndex, 1);
  
  return response.status(204).send();
});

module.exports = app;