"use client";

import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-black text-white py-4 md:px-8 px-3 shadow-lg">

      {/* Logo */}
      <div className="logo font-extrabold text-2xl tracking-wide">
        <span className="cursor-pointer transition-colors hover:text-violet-200">
          iTask Manager
        </span>
      </div>

      {/* Right Side */}
      <ul className="flex items-center space-x-3 font-medium">

        {/* Avatar */}
        <li className="cursor-pointer">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white hover:scale-105 transition">
            <Image
              src="https://res.cloudinary.com/dyvpe5aio/image/upload/w_200,h_200,c_fill/v1776712852/wallpaper_kzm12i.jpg"
              alt="User Avatar"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        </li>

        {/* My Task */}
        <li className="cursor-pointer relative group font-bold hover:text-violet-200">
          My Task
        </li>

      </ul>
    </nav>
  );
};

export default Navbar;