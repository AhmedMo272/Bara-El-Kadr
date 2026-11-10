import { useEffect, useState } from "react";
import { api } from "../services/api";
import { team as localTeam } from "../data/team";
import { partners as localPartners } from "../data/partners";
import { opportunities as localOpportunities } from "../data/opportunities";

let cache = null;

const toBilingual = (row, keys) => {
  const out = { ...row };
  keys.forEach((k) => {
    out[k] = { ar: row[`${k}_ar`] || "", en: row[`${k}_en`] || "" };
  });
  return out;
};

export default function usePublicContent() {
  const [data, setData] = useState(
    cache || {
      team: localTeam,
      partners: localPartners,
      opportunities: localOpportunities,
    }
  );

  useEffect(() => {
    if (cache) return;
    api("publicContent").then((res) => {
      if (!res.ok) return;
      cache = {
        team: res.team.length
          ? res.team.map((r) => ({
              ...toBilingual(r, ["name", "role", "bio"]),
              photo: r.photo_url,
              links: {
                linkedin: r.linkedin,
                instagram: r.instagram,
                email: r.email,
              },
            }))
          : localTeam,
        partners: res.partners.length
          ? res.partners.map((r) => ({
              ...toBilingual(r, ["name"]),
              logo: r.logo_url,
              url: r.website_url,
            }))
          : localPartners,
        opportunities: res.opportunities.length
          ? res.opportunities.map((r) => ({
              ...toBilingual(r, ["title", "requirements"]),
              link: r.apply_url,
            }))
          : localOpportunities,
      };
      setData(cache);
    });
  }, []);

  return data;
}