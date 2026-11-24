import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Analytics() {
  const [selected, setSelected] = useState(0);
  const [shortlisted, setShortlisted] = useState(0);
  const [rejected, setRejected] = useState(0);

  useEffect(() => {
    const loadAnalytics = async () => {
      const snapshot = await getDocs(
        collection(db, "applications")
      );

      let selectedCount = 0;
      let shortlistedCount = 0;
      let rejectedCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (data.status === "Selected") {
          selectedCount++;
        }

        if (data.status === "Shortlisted") {
          shortlistedCount++;
        }

        if (data.status === "Rejected") {
          rejectedCount++;
        }
      });

      setSelected(selectedCount);
      setShortlisted(shortlistedCount);
      setRejected(rejectedCount);
    };

    loadAnalytics();
  }, []);

  return (
    <div>
      <h1>Placement Analytics</h1>

      <h2>Selected: {selected}</h2>

      <h2>Shortlisted: {shortlisted}</h2>

      <h2>Rejected: {rejected}</h2>
    </div>
  );
}

export default Analytics;