export const getMain =  (req,res) => {
  res.send("in main");
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