import React from "react";

const PricingDescription = ({ data, update, next, back }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pricing & Description</h2>

      <input
        type="number"
        placeholder="Price (PKR)"
        value={data.price}
        onChange={(e) => update({ price: e.target.value })}
        className="border p-3 rounded w-full mb-4"
      />

      <textarea
        placeholder="Property Description"
        value={data.description}
        onChange={(e) => update({ description: e.target.value })}
        className="border p-3 rounded w-full h-32"
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          className="px-6 py-3 border rounded"
        >
          Back
        </button>

        <button
          onClick={next}
          className="bg-teal-600 text-white px-6 py-3 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PricingDescription;
