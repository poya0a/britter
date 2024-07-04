import type { Metadata } from "next";
import Page from "@components/common/Page";

export const metadata: Metadata = {
  title: "CREATE",
};

export default function View() {
  return <Page type={"view"} />;
}
