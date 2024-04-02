import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ filter, handleFilter }) => {
  return (
    <form>
      <div>filter shown with: <input value={filter} onChange={handleFilter} /></div>
    </form>
  );
};

const PersonForm = ({ addPerson, newTitle, newAuthor, newUrl, handleTitleChange, handleAuthorChange, handleUrlChange }) => {
  return (
    <form onSubmit={addPerson}>
      <div>Title: <input value={newTitle} onChange={handleTitleChange} /></div>
      <div>Author: <input value={newAuthor} onChange={handleAuthorChange} /></div>
      <div>Url: <input value={newUrl} onChange={handleUrlChange} /></div>
      <div><button type="submit">add</button></div>
    </form>
  );
};


const Persons = ({ persons, handleLike, deletePerson }) => {
  return (
    <ul>
      {persons.map(person => (
        <li className='person' key={person._id}>
        <div className="person-info">
          <div className="person-details">
            <span className="person-title">{person.title}</span>
            <span className="person-author">{person.author}</span>
            <span className="person-url">{person.url}</span>
          </div>
          <div className="person-actions">
            <button className="like-button" onClick={() => handleLike(person._id)}>Like it</button>
            <span className="likes-count">Likes: {person.likes}</span>
            <button className="delete-button" onClick={() => deletePerson(person._id)}>Delete</button>
          </div>
        </div>
      </li>

      ))}
    </ul>
  );
};

const Notification = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isVisible) {
    return null;
  }

  let className = 'notification'
  if (type === 'error') {
    className = 'error'
  }

  return (
    <div className={className}>
      {message}
    </div>
  );
}

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [likes, setLikes] = useState(0);
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(true)
  const [message, setMessage] = useState('message recevied.')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault();
    const existPerson = persons.find((person) => person.url === newUrl)
    if (existPerson) {
      const confirmation = window.confirm('This blog already exists, replace the old information with a new one?');
      if (confirmation) {
        const updatePerson = { ...existPerson, author: newAuthor, title: newTitle }
        personService
          .update(existPerson._id, updatePerson)
          .then(returnedPerson => {
            const updatePersons = persons.map(person => (person._id === returnedPerson._id ? returnedPerson : person))
            setPersons(updatePersons)
            setNewAuthor('')
            setNewTitle('')
            setLikes(0)
          })
          .catch(error => {
            setMessage(`Information of ${newUrl} has been removed from server`)
            setIsError(true)
          })
        setMessage(`${existPerson.url} information changed`)
      }
    }
    else {
      let idint;
      if (persons.length == 0) {
        idint = 1
      }
      else {
        idint = persons.length + 1
      }
      let existId = persons.find((person) => person._id == idint)
      while (existId) {
        idint = idint + 1
        existId = persons.find((person) => person._id == idint)
      }
      const newPerson = { title: newTitle, author: newAuthor, _id: idint.toString(), url: newUrl };
      personService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewTitle('')
          setNewAuthor('')
          setNewUrl('')
          setLikes(0)
        })
      setMessage(`${newTitle} blog added`)
    }
  }

  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };

  const handleAuthorChange = (event) => {
    setNewAuthor(event.target.value);
  };

  const handleUrlChange = (event) => {
    setNewUrl(event.target.value);
  };

  const handleLike = (personID) => {
    setPersons(prevPersons => prevPersons.map(person => {
      if(person._id === personID){
        return{...person, likes: person.likes +1 }
      }
      return person
    }))
  };

  const handleFilter = (event) => {
    setFilter(event.target.value);
    setShowAll(false); // Set to false whenever the filter changes
  };

  const deletePerson = id => {
    const confirmation = window.confirm('Delete this blog?');
    if (confirmation) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        })
      setMessage(`the blog information deleted`)
    }
  }

  const personsToShow = showAll
    ? persons
    : persons.filter(persons => persons.title.toLowerCase().includes(filter.toLowerCase()))


  const [className, setClassName] = useState('notification')
  if (isError) {
    setClassName('error')
  }

  return (
    <div>
      <h2>Blog List</h2>
      <Notification message={message} type={className} />
      <Filter filter={filter} handleFilter={handleFilter} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newTitle={newTitle}
        newAuthor={newAuthor}
        newUrl={newUrl}
        handleTitleChange={handleTitleChange}
        handleAuthorChange={handleAuthorChange}
        handleUrlChange={handleUrlChange}
      />
      <h3>List</h3>
      <Persons persons={personsToShow} handleLike={handleLike} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
