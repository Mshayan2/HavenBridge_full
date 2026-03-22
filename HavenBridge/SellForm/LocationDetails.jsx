import React from "react";

const LocationDetails = ({ data, update, next, back }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Location Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="City"
          value={data.city}
          onChange={(e) => update({ city: e.target.value })}
          className="border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Full Address / Location"
          value={data.location}
          onChange={(e) => update({ location: e.target.value })}
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

export default LocationDetails;
