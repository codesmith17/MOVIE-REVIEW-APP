import ClipLoader from "react-spinners/ClipLoader"; // Importing loading spinner from react-spinners
const Loading = (props) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#10B981" loading={props.loading} size={50} />
    </div>
  );
};

export default Loading;
