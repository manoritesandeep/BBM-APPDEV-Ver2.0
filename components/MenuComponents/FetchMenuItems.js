import { useEffect, useState } from "react";
import { readCollection } from "../../util/firebaseUtils";

export default function useFetchMenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const data = await readCollection("menuItems");
        setMenuItems(data);
      } catch (err) {
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMenuItems();
  }, []);

  return { menuItems, loading };
}
