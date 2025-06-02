import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize, useGridDimensions } from "../hooks";
import { BinderGrid } from "../components/binder";

const Binder = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { binderId } = useParams();

  // Custom hooks for responsive behavior
  const windowSize = useWindowSize();
  const gridDimensions = useGridDimensions(windowSize);

  const handleAddCard = (slot) => {
    // TODO: Implement add card functionality
    console.log(`Add card to slot ${slot} in binder ${binderId}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <BinderGrid gridDimensions={gridDimensions} onAddCard={handleAddCard} />
    </div>
  );
};

export default Binder;
