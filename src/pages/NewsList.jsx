import { useNavigate } from "react-router-dom";
import { readAllNews } from "../utils/newsLocal";
import "../css/news-list.css";

export default function NewsList(){

  const navigate = useNavigate();
  const news = readAllNews().sort(
    (a,b)=> new Date(b.createdAt)-new Date(a.createdAt)
  );

  return(
    <div className="news-list">

      <h1 className="news-list-title">ข่าวทั้งหมด</h1>

      {news.map(n=>(
        <div
          key={n.id}
          className="news-list-card"
          onClick={()=>navigate(`/news/${n.id}`)}
        >
          <img src={n.image} />

          <div>
            <h3>{n.title}</h3>
            <p>{n.text.slice(0,120)}...</p>
            <span className="date">
              {new Date(n.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}

    </div>
  );
}
