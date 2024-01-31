import React, { useState, useEffect } from "react";
import classes from "../Header/Header.module.css";
import { Select } from "antd";

interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string | null;
}

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [bookSuggestions, setBookSuggestions] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const fetchBookSuggestions = async (
    paginate: boolean = false
  ): Promise<void> => {
    try {
      let url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=5`;

      if (paginate) {
        url += `&startIndex=${(currentPage - 1) * 5}`;
      }

      if (selectedCategory) {
        url += `&subject=${selectedCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        const suggestions: Book[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors,
          thumbnail: item.volumeInfo.imageLinks
            ? item.volumeInfo.imageLinks.thumbnail
            : null,
        }));

        setBookSuggestions((prevSuggestions) =>
          paginate ? [...prevSuggestions, ...suggestions] : suggestions
        );
      } else {
        setBookSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching book suggestions:", error);
    }
  };

  const handleSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string): void => {
    setSelectedCategory(value);
  };

  const loadMoreBooks = (): void => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchBookSuggestions();
    } else {
      setBookSuggestions([]);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchBookSuggestions(true);
    }
  }, [currentPage, selectedCategory]);

  return (
    <div>
      <div className={classes.fon}>
        <h1 className={classes.title}>Search For Book</h1>
        <input
          className={classes.search}
          type="text"
          value={searchTerm}
          onChange={handleSearchInputChange}
          placeholder="Enter book title"
        />
        <div className={classes.selects}>
          <h3 id={classes.nameOfCategory}>Categories 
            <Select
              className={classes.category}
              showSearch
              placeholder="all"
              optionFilterProp="children"
              onChange={handleCategoryChange}
              value={selectedCategory}
              options={[
                {
                  value: "all",
                  label: "All",
                },
                {
                  value: "art",
                  label: "Art",
                },
                {
                  value: "biography",
                  label: "Biography",
                },
                {
                  value: "computers",
                  label: "Computers",
                },
                {
                  value: "history",
                  label: "History",
                },
                {
                  value: "medical",
                  label: "Medical",
                },
                {
                  value: "poetry",
                  label: "Poetry",
                },
              ]}
            />
          </h3>
        </div>
      </div>
      <ul>
        {bookSuggestions.map((book) => (
          <div className={classes.books} key={book.id}>
            <div className={classes.info}>
              <div>
                {book.thumbnail && (
                  <img src={book.thumbnail} alt={book.title} />
                )}
              </div>
              <div>
                <p>{book.title}</p>
                <p>{book.authors && book.authors.join(", ")}</p>
              </div>
            </div>
          </div>
        ))}
      </ul>
      {bookSuggestions.length > 0 && (
        <button className={classes.more} onClick={loadMoreBooks}>
          LOAD MORE
        </button>
      )}
    </div>
  );
};

export default Header;
