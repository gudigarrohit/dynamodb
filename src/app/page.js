"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

export default function Home() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showFinished, setShowFinished] = useState(true);

  // Load todos from DB
  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // Format date/time
  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} & ${hours}:${minutes} ${ampm}`;
  };

  const toggleFinished = () => {
    setShowFinished(!showFinished);
  };

  // Edit todo
  const handleEdit = (item) => {
    setTodo(item.todo);
    setEditId(item._id);
  };

  // Delete todo
  const handleDelete = async (id) => {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    setTodos(todos.filter((item) => item._id !== id));
  };

  // Add or Update todo
  const handleAdd = async () => {
    if (todo.trim() === "") return;

    // Update mode
    if (editId) {
      const existingTodo = todos.find((t) => t._id === editId);

      const updatedTodo = {
        ...existingTodo,
        todo,
      };

      await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      setTodos(
        todos.map((t) => (t._id === editId ? updatedTodo : t))
      );

      setEditId(null);
    }

    // Create mode
    else {
      const newTodo = {
        todo,
        isCompleted: false,
      };

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const savedTodo = await res.json();

      setTodos([...todos, savedTodo]);
    }

    setTodo("");
  };

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  // Toggle checkbox
  const handleCheckbox = async (id) => {
    const newTodos = [...todos];
    const index = newTodos.findIndex((item) => item._id === id);

    if (index === -1) return;

    newTodos[index].isCompleted =
      !newTodos[index].isCompleted;

    const updatedTodo = newTodos[index];

    await fetch("/api/todos", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    });

    setTodos(newTodos);
  };

  return (
    <>
      <Navbar />

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
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* Show Finished */}
        <div className="flex items-center gap-2 mb-6">
          <input
            onChange={toggleFinished}
            type="checkbox"
            checked={showFinished}
            className="cursor-pointer"
          />
          <label>Show Finished</label>
        </div>

        {/* Todos List */}
        <h2 className="text-3xl font-extrabold mb-6 text-purple-200">
          Your Todos
        </h2>

        <div className="space-y-4">
          {todos.length === 0 && (
            <div className="text-center text-white">
              No todos to display
            </div>
          )}

          {todos.map(
            (item) =>
              (showFinished || !item.isCompleted) && (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-white rounded-xl px-5 py-3"
                >
                  {/* Left section */}
                  <div className="flex gap-3 items-center w-[65%]">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() =>
                        handleCheckbox(item._id)
                      }
                    />

                    <div className="flex flex-col">
                      <div
                        className={`font-semibold ${
                          item.isCompleted
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {item.todo}
                      </div>

                      {/* Date + Time */}
                      <div className="text-xs text-gray-500">
                        {item.createdAt &&
                          formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 px-2 py-1 rounded text-white"
                    >
                      <CiEdit />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      className="bg-red-500 px-2 py-1 rounded text-white"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
}