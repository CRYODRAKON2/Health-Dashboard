from typing import List
from datetime import datetime
from fastapi import HTTPException
from app.database import get_supabase_client
from app.models import VitalsCreate, VitalsResponse

class VitalsService:
    def __init__(self):
        self.supabase = get_supabase_client()

    async def get_user_vitals(self, user_id: str) -> List[VitalsResponse]:
        """Get all vitals for a user"""
        try:
            response = await self.supabase.table("vitals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            if response.data:
                return [VitalsResponse(**vital) for vital in response.data]
            return []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching vitals: {str(e)}")

    async def create_vitals(self, user_id: str, vitals: VitalsCreate) -> VitalsResponse:
        """Create a new vitals entry"""
        try:
            vitals_data = {
                "user_id": user_id,
                "heart_rate": vitals.heart_rate,
                "temperature": vitals.temperature,
                "spo2": vitals.spo2,
                "blood_pressure_systolic": vitals.blood_pressure_systolic,
                "blood_pressure_diastolic": vitals.blood_pressure_diastolic,
                "notes": vitals.notes,
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = await self.supabase.table("vitals").insert(vitals_data).execute()
            
            if response.data:
                return VitalsResponse(**response.data[0])
            else:
                raise HTTPException(status_code=500, detail="Failed to create vitals entry")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating vitals: {str(e)}")

    async def delete_vitals(self, user_id: str, vital_id: int):
        """Delete a vitals entry"""
        try:
            # First check if the vital belongs to the user
            response = await self.supabase.table("vitals").select("id").eq("id", vital_id).eq("user_id", user_id).execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="Vital not found or access denied")
            
            # Delete the vital
            await self.supabase.table("vitals").delete().eq("id", vital_id).eq("user_id", user_id).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting vitals: {str(e)}")

    async def get_vitals_summary(self, user_id: str) -> dict:
        """Get a summary of user's vitals"""
        try:
            response = await self.supabase.table("vitals").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            
            if not response.data:
                return {
                    "total_entries": 0,
                    "latest_heart_rate": None,
                    "latest_temperature": None,
                    "latest_spo2": None,
                    "latest_blood_pressure": None
                }
            
            vitals = response.data
            latest = vitals[0]
            
            return {
                "total_entries": len(vitals),
                "latest_heart_rate": latest.get("heart_rate"),
                "latest_temperature": latest.get("temperature"),
                "latest_spo2": latest.get("spo2"),
                "latest_blood_pressure": f"{latest.get('blood_pressure_systolic')}/{latest.get('blood_pressure_diastolic')}"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching vitals summary: {str(e)}")
