const PropertyDocs = ({ updateFormData }) => (
  <div className="card">
    <h2>Property Documents</h2>

    <input type="file" onChange={(e) => updateFormData("titleDeed", e.target.files[0])} />
    <input type="file" onChange={(e) => updateFormData("taxReceipt", e.target.files[0])} />
    <input type="file" onChange={(e) => updateFormData("utilityBill", e.target.files[0])} />
    <input type="file" onChange={(e) => updateFormData("idCard", e.target.files[0])} />
  </div>
);

export default PropertyDocs;
