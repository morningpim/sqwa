import { useParams, useNavigate } from "react-router-dom";
import { readAllNews } from "../utils/newsLocal";
import "../css/news-detail.css";

export default function NewsDetail(){

  const { id } = useParams();
  const navigate = useNavigate();

  const news = readAllNews();
  const item = news.find(n=>n.id===id);

  if(!item){
    return <div className="news-detail-empty">ไม่พบข่าว</div>;
  }

  return(
    <div className="news-detail">

      <button className="back-btn" onClick={()=>navigate(-1)}>
        ← กลับ
      </button>

      <h1 className="news-detail-title">{item.title}</h1>

      <div className="news-detail-date">
        {new Date(item.createdAt).toLocaleDateString()}
      </div>

      <img
        src={item.image}
        className="news-detail-image"
        alt={item.title}
      />

      <div className="news-detail-content">
        {item.text}
      </div>

    </div>
  );
}
