import { useEffect, useState } from "react";
import { readCollection } from "../../../util/firebaseUtils";

export default function useFetchRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRentals() {
      try {
        const data = await readCollection("rentals");
        setRentals(data);
      } catch (err) {
        setRentals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRentals();
  }, []);

  return { rentals, loading };
}
