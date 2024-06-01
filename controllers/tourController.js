// getAllTours
// createTour
// getTour
// updateTour
// deleteTour

export const getAllTours = async (req, res) => {
  res.status(200).json({ message: "Get all tours" });
};

export const createTour = async (req, res) => {
  res.status(200).json({ message: "Create tour" });
};

export const getTour = async (req, res) => {
  res.status(200).json({ message: "Get tour" });
};

export const updateTour = async (req, res) => {
  res.status(200).json({ message: "Update tour" });
};

export const deleteTour = async (req, res) => {
  res.status(200).json({ message: "Delete tour" });
};
