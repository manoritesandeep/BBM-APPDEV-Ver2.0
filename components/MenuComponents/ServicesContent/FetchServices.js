import { useEffect, useState } from "react";
import { readCollection } from "../../../util/firebaseUtils";

export default function useFetchServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await readCollection("services");
        setServices(data);
      } catch (err) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return { services, loading };
}
