import React from "react";

const PropertyBasics = ({ data, update, next }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Property Basics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Property Title"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          className="border p-3 rounded"
        />

        <select
          value={data.type}
          onChange={(e) => update({ type: e.target.value })}
          className="border p-3 rounded"
        >
          <option value="">Property Type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="plot">Plot</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <button
        onClick={next}
        className="mt-6 bg-teal-600 text-white px-6 py-3 rounded"
      >
        Next
      </button>
    </div>
  );
};

export default PropertyBasics;
