// createUser;
// getUser;
// updateUser;
// deleteUser;

export const getAllUsers = async (req, res) => {
  res.status(200).json({ message: "Get all users" });
};

export const createUser = async (req, res) => {
  res.status(200).json({ message: "Create user" });
}
export const getUser = async (req, res) => {
  res.status(200).json({ message: "Get user" });
}

export const updateUser = async (req, res) => {
  res.status(200).json({ message: "Update user" });
}

export const deleteUser = async (req, res) => {
  res.status(200).json({ message: "Delete user" });
}