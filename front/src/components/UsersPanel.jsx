const Users = () => {

  const users = [
    {
      name: "John Doe",
      email: "john@email.com",
      tasks: 2
    },
    {
      name: "Jane Smith",
      email: "jane@email.com",
      tasks: 3
    }
  ];

  return (

    <div>

      <h2>Users</h2>

      {users.map((user, index) => (

        <div key={index} className="user-card">

          <h3>{user.name}</h3>

          <p>Email: {user.email}</p>

          <p>Tasks Assigned: {user.tasks}</p>

        </div>

      ))}

    </div>

  );
};

export default Users;