import { Card, Button } from "react-bootstrap";

export default function ExpenseCard({data}) {
  return (
    <Card 
      className="shadow-sm border-0 mb-3 m-2" 
      style={{ minWidth:'250px', backgroundColor:'#e4e4e4a8'}}   // forces smaller width
    >
      <Card.Body>
        
        {/* TITLE */}
        <h5 className="fw-bold text-primary mb-3">{data.title}</h5>

        {/* DETAILS */}
        <div className="mb-1">
          <small className="text-muted">Amount:</small>
          <span className="ms-2 fw-semibold">₹{data.amount}</span>
        </div>

        <div className="mb-1">
          <small className="text-muted">Category:</small>
          <span className="ms-2">{data.category}</span>
        </div>

        <div className="mb-1">
          <small className="text-muted">Notes:</small>
          <span className="ms-2">{data.notes}</span>
        </div>

        <div className="mb-1">
          <small className="text-muted">Date:</small>
          <span className="ms-2">
            {new Date(data.date).toLocaleDateString()}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button variant="outline-primary" size="sm">
            Update
          </Button>

          <Button variant="outline-danger" size="sm">
            Delete
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
}
