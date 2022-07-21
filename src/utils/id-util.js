
import SnowflakeId from 'snowflake-id'

const id = new SnowflakeId()

export const uuid = () => {
    return id.generate()
}
