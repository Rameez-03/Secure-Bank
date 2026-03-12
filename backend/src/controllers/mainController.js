import User from "../models/User.js"

export async function getUser(req,res) {
  try {
    const user = await User.find()
    res.status(200).json(user)

  } catch (error) {
    console.error("Error in getUser", error)
    res.status(500).json({message:"Internal Error"})
  }

}

export const postMain =  (req,res) => {
  res.status(201).json({message:"Post Created"});
}

export const putMain =  (req,res) => {
  res.status(200).json({message:"Post Updated"});
}

export const deleteMain =  (req,res) => {
  res.status(200).json({message:"Post Deleted"});
}