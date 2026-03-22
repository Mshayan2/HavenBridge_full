import React from "react";

const PropertySpecs = ({ data, update, next, back }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Property Specifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          placeholder="Bedrooms"
          value={data.bedrooms}
          onChange={(e) => update({ bedrooms: e.target.value })}
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="Bathrooms"
          value={data.bathrooms}
          onChange={(e) => update({ bathrooms: e.target.value })}
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="Area (sq ft)"
          value={data.area}
          onChange={(e) => update({ area: e.target.value })}
          className="border p-3 rounded"
        />
      </div>

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

export default PropertySpecs;
