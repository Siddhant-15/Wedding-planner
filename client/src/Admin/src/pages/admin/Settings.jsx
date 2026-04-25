import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import Card from "../../components/admin/ui/Card";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import styles from "./Settings.module.css";

export default function Settings() {
  const [cats, setCats] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [c, s] = await Promise.all([adminApi.getCategories(), adminApi.getSettings()]);
        if (!alive) return; setCats(c); setSettings(s);
      } catch (e) { if (alive) setError(e.message || "Failed to load settings."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const addCat = async () => {
    const name = newCat.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try { const updated = await adminApi.saveCategory({ name, slug, active: true }); setCats(updated); setNewCat(""); }
    catch (e) { alert(e.message); }
  };
  const toggleCat = async (c) => {
    try { const updated = await adminApi.saveCategory({ ...c, active: !c.active }); setCats(updated); }
    catch (e) { alert(e.message); }
  };
  const removeCat = async () => {
    try { const updated = await adminApi.deleteCategory(confirmDel.id); setCats(updated); }
    catch (e) { alert(e.message); }
    finally { setConfirmDel(null); }
  };
  const toggleSetting = async (key) => {
    const next = { [key]: !settings[key] };
    try { const updated = await adminApi.saveSettings(next); setSettings(updated); }
    catch (e) { alert(e.message); }
  };

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <Card title="Manage Categories">
        <div className={styles.addRow}>
          <input
            className={styles.input}
            placeholder="Add category (e.g. Mehendi Artist)"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCat()}
          />
          <button className={styles.btnPrimary} onClick={addCat}>Add</button>
        </div>
        <div className={styles.catList}>
          {cats.map((c) => (
            <div key={c.id} className={styles.catRow}>
              <div>
                <div className={styles.catName}>{c.name}</div>
                <div className={styles.catSlug}>/{c.slug}</div>
              </div>
              <div className={styles.catActions}>
                <button className={styles.toggleBtn} onClick={() => toggleCat(c)}>
                  {c.active ? "Active" : "Inactive"}
                </button>
                <button className={styles.delBtn} onClick={() => setConfirmDel(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Approval Settings">
        <ToggleRow
          label="Auto-approve new services"
          description="If enabled, new vendor service submissions become active without review."
          checked={!!settings.autoApproveServices}
          onChange={() => toggleSetting("autoApproveServices")}
        />
        <ToggleRow
          label="Auto-approve customer reviews"
          description="If enabled, reviews are published immediately. Otherwise they wait for moderation."
          checked={!!settings.autoApproveReviews}
          onChange={() => toggleSetting("autoApproveReviews")}
        />
        <ToggleRow
          label="Require vendor KYC"
          description="Vendors must complete KYC before listings go live."
          checked={!!settings.requireVendorKYC}
          onChange={() => toggleSetting("requireVendorKYC")}
        />
      </Card>

      <Card title="Platform Rules">
        <ul className={styles.rules}>
          <li>Listings must include a clear description and at least one image.</li>
          <li>Pricing must reflect actual offered rates.</li>
          <li>No duplicate listings from the same vendor.</li>
          <li>Reviews must follow the community guidelines.</li>
        </ul>
      </Card>

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete category?"
        message={`This will remove "${confirmDel?.name}". Existing services in this category may need to be re-categorized.`}
        confirmText="Delete"
        tone="danger"
        onClose={() => setConfirmDel(null)}
        onConfirm={removeCat}
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className={styles.toggleRow}>
      <div>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleDesc}>{description}</div>
      </div>
      <span className={styles.switch}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className={styles.slider} />
      </span>
    </label>
  );
}
