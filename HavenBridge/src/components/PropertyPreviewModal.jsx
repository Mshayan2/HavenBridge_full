import React from "react";
import { toAssetUrl } from "../utils/url";

export default function PropertyPreviewModal({ property, onClose, onApprove, onReject, onDelete, onEditReservationPolicy }) {
  if (!property) return null;

  const img = property.images && property.images.length > 0 ? toAssetUrl(property.images[0]) : "/vite.svg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{property.title || "Property preview"}</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 rounded border">Close</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <img src={img} alt={property.title} className="w-full h-48 object-cover rounded" />
          </div>
          <div className="md:col-span-2">
            <div className="mb-2 text-sm text-gray-600">Location</div>
            <div className="font-semibold mb-3">{property.location || property.address || "—"}</div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Price</div>
                <div className="font-semibold">{property.price ? `PKR ${property.price}` : "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Type</div>
                <div className="font-semibold">{property.type || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-semibold">{((property.status && String(property.status).toLowerCase() !== 'available') ? String(property.status) : (property.approval?.status || 'pending'))}</div>
              </div>
              <div>
                <div className="text-gray-500">Posted</div>
                <div className="font-semibold">{property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "—"}</div>
              </div>
            </div>

            {property.description ? (
              <div className="mt-4 text-sm text-gray-700">{property.description.slice(0, 400)}</div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onEditReservationPolicy && onEditReservationPolicy(property)} className="px-3 py-1 rounded bg-gray-900 text-white">Reservation</button>
              {property.approval?.status === 'pending' ? (
                <>
                  <button
                    onClick={() => onApprove && onApprove(property._id)}
                    className={`px-3 py-1 rounded bg-green-600 text-white ${['rented','sold'].includes(String(property.status || '').toLowerCase()) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={['rented','sold'].includes(String(property.status || '').toLowerCase())}
                  >
                    Approve
                  </button>
                  <button onClick={() => onReject && onReject(property._id)} className="px-3 py-1 rounded bg-yellow-500 text-white">Reject</button>
                </>
              ) : null}
              <button
                onClick={() => onDelete && onDelete(property._id)}
                className={`px-3 py-1 rounded bg-red-600 text-white ${['rented','sold'].includes(String(property.status || '').toLowerCase()) ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={['rented','sold'].includes(String(property.status || '').toLowerCase())}
              >
                Delete
              </button>
              <a href={`/properties/${property._id}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded border">Open Public</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
