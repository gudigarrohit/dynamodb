"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { v4 as uuidv4 } from "uuid";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

export default function Home() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showFinished, setshowFinished] = useState(true);

  // ✅ LOAD FROM DATABASE
  useEffect(() => {
    fetch("/api/todos")
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const toggleFinished = () => {
    setshowFinished(!showFinished);
  };

  // ✅ EDIT (same behavior as before)
const handleEdit = (item) => {
  setTodo(item.todo);
  setEditId(item.id);
};

  // ✅ DELETE FROM DB
  const handleDelete = async (id) => {
    await fetch("/api/todos", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    setTodos(todos.filter((item) => item.id !== id));
  };

  // ✅ ADD TO DB
const handleAdd = async () => {
  if (todo.trim() === "") return;

  // 🔴 UPDATE MODE
  if (editId) {
    const updated = {
      id: editId,
      todo,
      isCompleted: todos.find(t => t.id === editId)?.isCompleted || false,
    };

    await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify(updated),
    });

    setTodos(todos.map(t => t.id === editId ? updated : t));
    setEditId(null);
  } 
  // 🟢 CREATE MODE
  else {
    const newTodo = {
      id: uuidv4(),
      todo,
      isCompleted: false,
    };

    await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    });

    setTodos([...todos, newTodo]);
  }

  setTodo("");
};
  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  // ✅ UPDATE CHECKBOX IN DB
  const handleCheckbox = async (e) => {
    let id = e.target.name;

    let newTodos = [...todos];
    let index = newTodos.findIndex((item) => item.id === id);

    newTodos[index].isCompleted = !newTodos[index].isCompleted;

    const updated = newTodos[index];

    await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify(updated),
    });

    setTodos(newTodos);
  };

  return (
    <>
      <Navbar />

      {/* SAME UI (unchanged) */}
      <div className="container bg-gradient-to-r from-violet-500 via-purple-900 shadow-2xl m-auto mt-7 rounded-2xl p-8 min-h-[82vh] w-11/12 md:w-2/3 lg:w-1/2">

        {/* Add Todo */}
        <div className="addtodo mb-8">
          <h2 className="text-2xl font-extrabold mb-4 text-purple-200">
            Add a Todo
          </h2>

          <div className="flex">
            <input
              onChange={handleChange}
              value={todo}
              type="text"
              placeholder="Enter your todos"
              className="bg-white text-black w-full rounded-lg px-4 py-2 mr-3 outline-none"
            />

            <button
              onClick={handleAdd}
              disabled={todo.length <= 1}
              className="bg-violet-700 hover:bg-violet-900 disabled:bg-violet-400 px-5 py-2 rounded-lg text-white"
            >
              Save
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <input
            onChange={toggleFinished}
            type="checkbox"
            checked={showFinished}
            className="cursor-pointer"
          />
          <label>Show Finished</label>
        </div>

        {/* Todos */}
        <h2 className="text-3xl font-extrabold mb-6 text-purple-200">
          Your Todos
        </h2>

        <div className="space-y-4">
          {todos.length === 0 && (
            <div className="text-center">No todos to display</div>
          )}

          {todos.map((item) => (
            (showFinished || !item.isCompleted) && (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white rounded-xl px-5 py-2"
              >
                <div className="flex gap-3 items-center w-[60%]">
                  <input
                    name={item.id}
                    onChange={handleCheckbox}
                    type="checkbox"
                    checked={item.isCompleted}
                  />

                  <div
                    className={`font-semibold ${
                      item.isCompleted
                        ? "line-through text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {item.todo}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 px-2 py-1 rounded text-white"
                  >
                    <CiEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 px-2 py-1 rounded text-white"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
}