function Profile() {
  return (
    <div>
      <h2>Profile</h2>
      <p>User profile page.</p>
      {/* If the user is logged in, display their information eg RF or their email picture if its available. If not, just show login. If the account has a an admin role or is in admin database, add a button for interchanging between admin role and normal user*/}
    </div>
  );
}

export default Profile;