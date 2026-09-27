import React, { useRef, useState } from 'react';
import { isValidId } from '../utils/helper/idValidator';
import MessagePop from '../assets/MessagePop';

const CollectionIdsInput = ({
  moduleIdName = '',
  placeHolder = '',
  idPrefix = '',
  idLength = 0,
  listOfIds,
  setListOfIds
}) => {
  const [id, setId] = useState('');

  const addInList = (id) => {
    const trimmedId = id.trim();
    const validation = isValidId(trimmedId, idPrefix, idLength);

    if (!validation.isValid) {
      alertMessage(validation.error);
      return;
    }

    if (listOfIds.includes(trimmedId)) {
      alertMessage(`ID '${trimmedId}' is already scanned.`);
      return;
    }

    setListOfIds([...listOfIds, trimmedId]);
    setId('');
    inputRef.current.focus();
  };

  const removeFromList = (index) => {
    setListOfIds(listOfIds.filter((_, i) => i !== index));
  };

  //! Start: Message Thing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const inputRef = useRef();

  const alertMessage = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
    inputRef.current.blur();
  };
  //! End: Message Thing

  return (
    <>
      <MessagePop
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
      />
      <label
        htmlFor="id"
        className="block mt-2 text-sm font-medium text-teal-900"
      >
        Scan {moduleIdName}
      </label>

      <div className="flex">
        <input
          type="text"
          id="id"
          value={id}
          name="id"
          ref={inputRef}
          onChange={(e) => {
            const value = e.target.value.trim();
            setId(e.target.value);
            if (value.length >= idLength) {
              addInList(value);
            }
          }}
          className="block w-full p-2 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
          placeholder={`Ex: ${placeHolder}`}
          required
        />
        <button
          type="button"
          onClick={() => addInList(id)}
          className="ml-2 bg-teal-700 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-teal-800"
        >
          Add
        </button>
      </div>

      <div className="mt-2">
        <h3 className="font-semibold">List Of Collected Ids:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {listOfIds.map((id, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 rounded-full bg-yellow-200"
            >
              <span className="mr-2">{index + 1}. {id}</span>
              <button
                onClick={() => removeFromList(index)}
                className="text-red-600 bg-red rounded-full hover:scale-50"
              >
                <img src="./assets/images/decline.png" alt="" className="w-6" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionIdsInput;