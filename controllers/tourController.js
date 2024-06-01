import Tour from "../models/tourModel.js";

export const getAllTours = async (req, res) => {

  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });

  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

export const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });

  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
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
