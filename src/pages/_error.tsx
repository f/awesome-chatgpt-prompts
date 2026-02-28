import * as Sentry from "@sentry/react";
import type { NextPageContext } from "next";
import Error, { ErrorProps } from "next/error";

const CustomErrorComponent = (props: ErrorProps) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // Capture the error to Sentry
  if (contextData.err) {
    Sentry.captureException(contextData.err);
  }

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
