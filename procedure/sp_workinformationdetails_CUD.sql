CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_workinformationdetails_CUD`(
    IN _intKey INT,                     -- 1 = insert, 2 = update, 3 = delete
    IN _intId INT,
    IN _intWorkId INT,
    IN _intPlatformId INT,
    IN _intPriorityId INT,
    IN _varDetails LONGTEXT,
    IN _varReferenceImageId VARCHAR(1000),
    IN _varMOMId VARCHAR(1000)
)
BEGIN

    -- INSERT
    IF _intKey = 1 THEN
    
        INSERT INTO workinformationdetails (
            intWorkId, intPlatformId, intPriorityId,
            varDetails, varReferenceImageId, varMOMId
        ) VALUES (
            _intWorkId, _intPlatformId, _intPriorityId,
            _varDetails, _varReferenceImageId, _varMOMId
        );

        SET _intId = LAST_INSERT_ID();
        SELECT _intId AS intId;

    -- UPDATE
    ELSEIF _intKey = 2 THEN

        UPDATE workinformationdetails
        SET 
            intPlatformId = _intPlatformId,
            intPriorityId = _intPriorityId,
            varDetails = _varDetails,
            varReferenceImageId = _varReferenceImageId,
            varMOMId = _varMOMId
        WHERE intId = _intId;

        SELECT _intId AS intId;

    -- DELETE
    ELSEIF _intKey = 3 THEN

        DELETE FROM workinformationdetails
        WHERE intId = _intId;

        SELECT _intId AS intId;

    END IF;

END