"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showFinished, setShowFinished] = useState(true);

  // Load todos
  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // Date + Time + Seconds format
  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} | ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const toggleFinished = () => {
    setShowFinished(!showFinished);
  };

  // Edit
  const handleEdit = (item) => {
    setTodo(item.todo);
    setEditId(item.id);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setTodos(todos.filter((item) => item.id !== id));

      toast.success("Todo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete todo");
    }
  };

  // Add / Update
  const handleAdd = async () => {
    if (todo.trim() === "") return;

    // UPDATE
    if (editId) {
      try {
        const existingTodo = todos.find(
          (t) => t.id === editId
        );

        const res = await fetch("/api/todos", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editId,
            todo,
            isCompleted: existingTodo.isCompleted,
          }),
        });

        const data = await res.json();

        const updatedTodo = {
          ...existingTodo,
          todo,
          createdAt: data.updatedAt,
        };

        setTodos(
          todos.map((t) =>
            t.id === editId ? updatedTodo : t
          )
        );

        toast.success("Todo updated successfully");

        setEditId(null);
      } catch (error) {
        toast.error("Failed to update todo");
      }
    }

    // CREATE
    else {
      try {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            todo,
            isCompleted: false,
          }),
        });

        const savedTodo = await res.json();

        setTodos([...todos, savedTodo]);

        toast.success("Todo created successfully");
      } catch (error) {
        toast.error("Failed to create todo");
      }
    }

    setTodo("");
  };

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  // Checkbox toggle
  const handleCheckbox = async (id) => {
    try {
      const updatedTodos = [...todos];
      const index = updatedTodos.findIndex(
        (item) => item.id === id
      );

      if (index === -1) return;

      updatedTodos[index].isCompleted =
        !updatedTodos[index].isCompleted;

      const updatedTodo = updatedTodos[index];

      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      const data = await res.json();

      updatedTodos[index].createdAt = data.updatedAt;

      setTodos(updatedTodos);

      toast.success("Todo status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Navbar />

      <div className="container mb-6 bg-gradient-to-r from-violet-500 via-purple-900 shadow-2xl m-auto mt-7 rounded-2xl p-8 min-h-[82vh] w-11/12 md:w-2/3 lg:w-1/2">

        {/* Add Todo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-200">
            Add a Todo
          </h2>

          <div className="flex">
            <input
              type="text"
              value={todo}
              onChange={handleChange}
              placeholder="Enter your todo"
              className="bg-white text-black w-full rounded-lg px-4 py-2 mr-3"
            />

            <button
              onClick={handleAdd}
              disabled={todo.length <= 1}
              className="bg-violet-700 hover:bg-violet-900 px-5 py-2 rounded-lg text-white"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* Show finished */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={showFinished}
            onChange={toggleFinished}
          />
          <label>Show Finished</label>
        </div>

        {/* Todo list */}
        <h2 className="text-3xl font-bold mb-6 text-purple-200">
          Your Todos
        </h2>

        <div className="space-y-4">
          {todos.length === 0 && (
            <div className="text-center text-white">
              No todos available
            </div>
          )}

          {todos.map(
            (item) =>
              (showFinished || !item.isCompleted) && (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white rounded-xl px-5 py-3"
                >
                  <div className="flex gap-3 items-center w-[65%]">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() =>
                        handleCheckbox(item.id)
                      }
                    />

                    <div className="flex flex-col">
                      <div
                        className={`font-semibold ${item.isCompleted
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                          }`}
                      >
                        {item.todo}
                      </div>

                      {/* Time Section */}
                      <div className="text-xs text-gray-500">
                        {item.createdAt &&
                          formatDate(item.createdAt)}
                      </div>
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
                      onClick={() =>
                        handleDelete(item.id)
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