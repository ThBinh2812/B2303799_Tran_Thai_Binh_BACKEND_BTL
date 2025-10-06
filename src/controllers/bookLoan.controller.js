import BookLoan from "../models/bookLoan.model.js";
import ApiError from "../api_error.js";

class BookLoansControllers {

  // [POST] /api/bookLoans
  async create(req, res, next) {
    try {
      const bookLoans = new BookLoan(req.body);
      await bookLoans.save();

      return res.send({ message: 'Book loans created successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while creating a book loan'))
    };
  };

  // [PUT] /api/bookLoans/:loanId
  async update(req, res, next) {
    try{
      const result =  await BookLoan.updateOne({ LOANID: req.params.loanId }, req.body);
      
      if(result.matchedCount === 0) {
        return next(new ApiError(404, 'Book loan not found'));
      }
      
      return res.send({ message: 'Book loan updated successfully'});

    } catch(error) {
    console.log(error);
    return next(new ApiError(500, 'An error occurred while updating a book loan'));
    };
  };

  // [GET] /api/bookLoans/:loanId
  async findOne(req, res, next) {
    try {
      const bookLoan = await BookLoan.findOne({ LOANID: req.params.loanId });
      
      if(!bookLoan) {
        return next(new ApiError(404, 'Book loan not found'));
      }

      return res.send(bookLoan);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving a book loan'));
    };
  };

  // [GET] /api/bookLoans
  async findAll(req, res, next) {
    try {
      const bookLoans = await BookLoan.find().lean();
      
      return res.send(bookLoans);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving book loans'))
    };
  };

  // [DELETE] /api/bookLoans/:loanId
  async delete(req, res, next) {
    try {
      const result = await BookLoan.deleteOne({ LOANID: req.params.loanId });

      if(result.deletedCount === 0) {
        return next(new ApiError(404, 'Book loan not found'));
      };
      
      return res.send({ message: 'Book loan deleted successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting a book loan'))
    };
  };

  // [DELETE] /api/bookLoans
  async deleteAll(req, res, next) {
    try {
      const result =  await BookLoan.deleteMany({});
      return res.send({ message: `${result.deletedCount} book loans deleted successfully`});
    
    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting book loans'));
    }; 
  };

};

export default new BookLoansControllers;
