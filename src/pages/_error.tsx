import type { NextPageContext } from "next";
import Error, { ErrorProps } from "next/error";

const CustomErrorComponent = (props: ErrorProps) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
