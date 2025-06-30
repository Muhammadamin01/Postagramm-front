import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Loader from "../components/Loader";

const UserStats = ({ userId }) => {
  const [liked, setLiked] = useState([]);
  const [commented, setCommented] = useState([]);
  const [myposts, setMyPosts] = useState([]);
  const [tab, setTab] = useState("myposts");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setErr("");
    Promise.all([
      api.get(`/api/user/${userId}/liked-posts`),
      api.get(`/api/user/${userId}/commented-posts`),
      api.get(`/api/user/${userId}/my-posts`)
    ]).then(([likeRes, comRes, myRes]) => {
      setLiked(likeRes.data);
      setCommented(comRes.data);
      setMyPosts(myRes.data);
      setLoading(false);
    }).catch(e => {
      setErr(e?.response?.data?.message || e.message);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Loader />;
  if (err) return <div className="error">{err}</div>;

  return (
    <div className="user-stats">
      <div className="tab-row">
        <button className={tab==="myposts"?"active":""} onClick={()=>setTab("myposts")}>Mening postlarim</button>
        <button className={tab==="liked"?"active":""} onClick={()=>setTab("liked")}>Layk bosgan postlarim</button>
        <button className={tab==="commented"?"active":""} onClick={()=>setTab("commented")}>Komment qoldirgan postlarim</button>
      </div>
      <div>
        {tab==="myposts" && (
          <ul>
            {myposts.length===0 && <li>Post yo‘q</li>}
            {myposts.map(p=>(
              <li key={p._id}><b>{p.title || "[No title]"}</b> - <span>{p.content?.slice(0,60)}</span></li>
            ))}
          </ul>
        )}
        {tab==="liked" && (
          <ul>
            {liked.length===0 && <li>Hech narsa yo‘q</li>}
            {liked.map(p=>(
              <li key={p._id}><b>{p.title || "[No title]"}</b> - <span>{p.content?.slice(0,60)}</span></li>
            ))}
          </ul>
        )}
        {tab==="commented" && (
          <ul>
            {commented.length===0 && <li>Hech narsa yo‘q</li>}
            {commented.map(item=>(
              <li key={item.comment._id}>
                <b>{item.post?.title || "[No title]"}</b> - <span>{item.comment.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default UserStats;