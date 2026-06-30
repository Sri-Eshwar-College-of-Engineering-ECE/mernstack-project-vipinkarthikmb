const RoleSelect = ({ role, setRole }) => (
    <div>
      <label>Choose Role:</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="citizen">Citizen</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
  
  export default RoleSelect;
  