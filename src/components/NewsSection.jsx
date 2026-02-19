import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/NewsSection.css";
import { readAllNews, subscribeNewsChanged } from "../utils/newsLocal";

export default function NewsSection(){

  const navigate = useNavigate();

  const sortNews = () =>
    readAllNews().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  const [news,setNews] = useState(sortNews);

  useEffect(()=>{
    const sync = ()=> setNews(sortNews());
    return subscribeNewsChanged(sync);
  },[]);

  if(news.length === 0){
    return (
      <section className="news-section">
        <div className="news-inner">
          <div className="news-header">
            <h2 className="news-title">ข่าวสารและข้อมูลเชิงลึก</h2>
          </div>
          <div className="empty-state">ยังไม่มีข่าว</div>
        </div>
      </section>
    );
  }

  const main = news[0];
  const side = news.slice(1,3);

  return (
    <section className="news-section">
      <div className="news-inner">

        <div className="news-header">
          <h2 className="news-title">ข่าวสารและข้อมูลเชิงลึก</h2>

          <button
            className="news-all-btn"
            onClick={()=>navigate("/news")}
          >
            All read →
          </button>
        </div>

        <div className="news-layout">

          {/* MAIN */}
          <article
            className="news-main"
            onClick={()=>navigate(`/news/${main.id}`)}
            style={{cursor:"pointer"}}
          >
            <img
              src={main.image || "/news-default.jpg"}
              alt={main.title}
              className="news-main-image"
            />

            <div className="news-main-content">
              <h3 className="news-item-title">{main.title}</h3>

              <p className="news-item-text">
                {main.text.slice(0,150)}...
              </p>

              <span className="news-readmore">
                อ่านเพิ่มเติม →
              </span>
            </div>
          </article>

          {/* SIDE */}
          <div className="news-side">
            {side.map(n=>(
              <article
                key={n.id}
                className="news-card"
                onClick={()=>navigate(`/news/${n.id}`)}
                style={{cursor:"pointer"}}
              >
                <img
                  src={n.image || "/news-default.jpg"}
                  alt={n.title}
                  className="news-card-image"
                />

                <div className="news-card-content">
                  <h3 className="news-item-title">{n.title}</h3>

                  <p className="news-item-text">
                    {n.text.slice(0,100)}...
                  </p>

                  <span className="news-readmore">
                    อ่านเพิ่มเติม →
                  </span>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
