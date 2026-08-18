import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCollectBooks } from '../hooks/useCollectBooks';
import { bookGradient } from '../utils/bookColor';
import './CollectBook.css';
import { useState } from 'react';
import CreateBookModal from '../components/CreateBookModal';

export default function CollectBook() {
  const navigate = useNavigate();
  const { data: books, isLoading, isError } = useCollectBooks();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="bm-page">
      <Header />
      <main className="bm-main">
        <div className="page-head">
          <div>
            <div className="page-title">콜랙트북</div>
            <div className="page-sub">
              이룬 기록이 쌓인 나의 책장. 책 1권은 1년이에요. 책을 눌러 펼쳐보세요.
            </div>
          </div>
          <div className="ph-actions">
            <button className="btn-fill" onClick={() => navigate('/collect/record/new')}>
              + 기록 추가
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="cb-empty">불러오는 중...</div>
        ) : isError ? (
          <div className="cb-empty">책장을 불러오지 못했어요.</div>
        ) : !books || books.length === 0 ? (
          <div className="cb-empty">아직 만든 콜랙트북이 없어요.</div>
        ) : (
          <div className="shelf">
            <div className="books">
              {books.map((b) => (
                <div
                  key={b.collectBookId}
                  className="book"
                  style={{ background: bookGradient(b.bookColor) }}
                  onClick={() => navigate(`/collect/${b.collectBookId}`)}
                  title={b.title}
                >
                  <div className="spine-emblem" />
                  <div className="spine-plate">
                    <span className="yr">{b.year}</span>
                  </div>
                  <div className="ttl-wrap">
                    <div className="ttl">{b.title}</div>
                  </div>
                  <div className="spine-emblem" />
                </div>
              ))}

              {/* 새 책 추가 슬롯 */}
              <div className="book book-add" title="새 책 만들기" onClick={() => setShowCreate(true)}>
                <span className="add-plus">+</span>
              </div>
            </div>
          </div>
        )}
      </main>
      {showCreate && <CreateBookModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}